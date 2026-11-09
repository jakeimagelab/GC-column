"use client";

import { useEffect, useRef, useState } from "react";
import type { ImageContentEntry } from "@/content/site-content-types";
import { textEditProps } from "@/content/site-content-types";
import { ImageSlot } from "./ImageSlot";
import styles from "./KakaoMap.module.css";

type LatLngInstance = object;
type KakaoMaps = {
  load: (callback: () => void) => void;
  LatLng: new (lat: number, lng: number) => LatLngInstance;
  Map: new (container: HTMLElement, options: { center: LatLngInstance; level: number }) => {
    addControl: (control: object, position: unknown) => void;
    setCenter: (position: LatLngInstance) => void;
    setZoomable: (enabled: boolean) => void;
  };
  Marker: new (options: { map: object; position: LatLngInstance }) => object;
  ZoomControl: new () => object;
  ControlPosition: { RIGHT: unknown };
  services: {
    Status: { OK: string };
    Geocoder: new () => { addressSearch: (address: string, callback: (result: Array<{ x: string; y: string }>, status: string) => void) => void };
  };
};

declare global {
  interface Window { kakao?: { maps: KakaoMaps } }
}

let kakaoPromise: Promise<KakaoMaps> | null = null;

function loadKakao(apiKey: string) {
  if (kakaoPromise) return kakaoPromise;
  kakaoPromise = new Promise<KakaoMaps>((resolve, reject) => {
    const ready = () => {
      if (!window.kakao?.maps) {
        reject(new Error("카카오맵을 불러오지 못했습니다."));
        return;
      }
      window.kakao.maps.load(() => resolve(window.kakao!.maps));
    };
    const existing = document.querySelector<HTMLScriptElement>("script[data-kakao-map-sdk]");
    if (existing) {
      if (window.kakao?.maps) ready();
      else {
        existing.addEventListener("load", ready, { once: true });
        existing.addEventListener("error", () => reject(new Error("카카오맵 SDK 로딩 실패")), { once: true });
      }
      return;
    }
    const script = document.createElement("script");
    script.dataset.kakaoMapSdk = "true";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(apiKey)}&autoload=false&libraries=services`;
    script.async = true;
    script.addEventListener("load", ready, { once: true });
    script.addEventListener("error", () => reject(new Error("카카오맵 SDK 로딩 실패")), { once: true });
    document.head.appendChild(script);
  }).catch((error) => {
    kakaoPromise = null;
    throw error;
  });
  return kakaoPromise;
}

type KakaoMapProps = {
  className?: string;
  apiKey: string;
  address: string;
  lat: string;
  lng: string;
  fallbackImage: ImageContentEntry;
  fallbackEditId: string;
};

export function KakaoMap({ className = "", apiKey, address, lat, lng, fallbackImage, fallbackEditId }: KakaoMapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(!apiKey);

  useEffect(() => {
    const element = wrapRef.current;
    if (!element || !apiKey) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setVisible(true);
      observer.disconnect();
    }, { rootMargin: "240px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [apiKey]);

  useEffect(() => {
    const container = mapRef.current;
    if (!visible || !apiKey || !container) return;
    let cancelled = false;
    void loadKakao(apiKey).then((maps) => {
      const placeMap = (latitude: number, longitude: number) => {
        if (cancelled) return;
        const position = new maps.LatLng(latitude, longitude);
        const map = new maps.Map(container, { center: position, level: 3 });
        map.setZoomable(false);
        map.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT);
        new maps.Marker({ map, position });
        setReady(true);
      };
      const latitude = Number(lat);
      const longitude = Number(lng);
      if (Number.isFinite(latitude) && Number.isFinite(longitude) && lat.trim() && lng.trim()) {
        placeMap(latitude, longitude);
        return;
      }
      const geocoder = new maps.services.Geocoder();
      geocoder.addressSearch(address, (result, status) => {
        if (status === maps.services.Status.OK && result[0]) placeMap(Number(result[0].y), Number(result[0].x));
        else if (!cancelled) setFailed(true);
      });
    }).catch(() => {
      if (!cancelled) setFailed(true);
    });
    return () => { cancelled = true; };
  }, [address, apiKey, lat, lng, visible]);

  const showFallback = failed || !ready;
  return (
    <div className={`${styles.wrap} ${className}`} ref={wrapRef}>
      {showFallback ? <ImageSlot className={styles.fallback} label="" alt="" variant="light" editId={fallbackEditId} image={fallbackImage} /> : null}
      {!failed && apiKey ? <div className={styles.canvas} ref={mapRef} hidden={!visible} aria-label={`${address} 카카오맵`} /> : null}
      <div className={styles.coordinates}>
        <button type="button" {...textEditProps("home.location.lat")}>위도 {lat || "입력"}</button>
        <button type="button" {...textEditProps("home.location.lng")}>경도 {lng || "입력"}</button>
      </div>
    </div>
  );
}
