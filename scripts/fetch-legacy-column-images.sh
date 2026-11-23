#!/usr/bin/env bash
# 기존 사이트 칼럼 이미지 내려받기 (레포 루트에서 실행)
set -euo pipefail
JAR=$(mktemp)
# 사이트가 JS로 CUPID 쿠키를 심는 구조라, 첫 응답에서 값을 뽑아 쿠키 파일에 넣는다
CUPID=$(curl -s "https://gloryclinic.co.kr/column/7" | grep -oE "CUPID=[^;'\"]+" | head -1 | cut -d= -f2 || true)
printf "gloryclinic.co.kr\tFALSE\t/\tFALSE\t0\tCUPID\t%s\n" "${CUPID:-x}" > "$JAR"
curl -s -c "$JAR" -b "$JAR" -L "https://gloryclinic.co.kr/column/7?ckattempt=1" -o /dev/null
mkdir -p "public/uploads/columns/ulthera-prime-shots" && curl -sf -b "$JAR" -L "https://gloryclinic.co.kr/data/editor/2610/thumb-20261013121947_02e8295d954d_1200x1173.jpg" -o "public/uploads/columns/ulthera-prime-shots/doctor.jpg" && echo "ok /uploads/columns/ulthera-prime-shots/doctor.jpg"
mkdir -p "public/uploads/columns/ulthera-prime-shots" && curl -sf -b "$JAR" -L "https://gloryclinic.co.kr/data/editor/2610/20261013114250_9fe05e9e9ce0.png" -o "public/uploads/columns/ulthera-prime-shots/figure-1.png" && echo "ok /uploads/columns/ulthera-prime-shots/figure-1.png"
mkdir -p "public/uploads/columns/ulthera-low-volume-face" && curl -sf -b "$JAR" -L "https://gloryclinic.co.kr/data/editor/2610/thumb-20261013122027_8ffa15776266_1200x1173.jpg" -o "public/uploads/columns/ulthera-low-volume-face/doctor.jpg" && echo "ok /uploads/columns/ulthera-low-volume-face/doctor.jpg"
mkdir -p "public/uploads/columns/ulthera-low-volume-face" && curl -sf -b "$JAR" -L "https://gloryclinic.co.kr/data/editor/2610/20261013131546_d78e0da0603e.png" -o "public/uploads/columns/ulthera-low-volume-face/figure-1.png" && echo "ok /uploads/columns/ulthera-low-volume-face/figure-1.png"
mkdir -p "public/uploads/columns/thermage-vs-ulthera" && curl -sf -b "$JAR" -L "https://gloryclinic.co.kr/data/editor/2610/thumb-20261014144626_18e1a98ba236_1200x1173.jpg" -o "public/uploads/columns/thermage-vs-ulthera/doctor.jpg" && echo "ok /uploads/columns/thermage-vs-ulthera/doctor.jpg"
mkdir -p "public/uploads/columns/thermage-vs-ulthera" && curl -sf -b "$JAR" -L "https://gloryclinic.co.kr/data/editor/2610/20261014150202_4ab60f0bfb0c.png" -o "public/uploads/columns/thermage-vs-ulthera/figure-1.png" && echo "ok /uploads/columns/thermage-vs-ulthera/figure-1.png"
mkdir -p "public/uploads/columns/thermage-vs-ulthera" && curl -sf -b "$JAR" -L "https://gloryclinic.co.kr/data/editor/2610/20261014150957_58af248ecf79.png" -o "public/uploads/columns/thermage-vs-ulthera/figure-2.png" && echo "ok /uploads/columns/thermage-vs-ulthera/figure-2.png"
mkdir -p "public/uploads/columns/lifting-cold-compress" && curl -sf -b "$JAR" -L "https://gloryclinic.co.kr/data/editor/2610/thumb-20261015145358_f238b6fffe37_1200x1173.jpg" -o "public/uploads/columns/lifting-cold-compress/doctor.jpg" && echo "ok /uploads/columns/lifting-cold-compress/doctor.jpg"
mkdir -p "public/uploads/columns/lifting-cold-compress" && curl -sf -b "$JAR" -L "https://gloryclinic.co.kr/data/editor/2610/20261016121705_ea5f766f4ce0.png" -o "public/uploads/columns/lifting-cold-compress/figure-1.png" && echo "ok /uploads/columns/lifting-cold-compress/figure-1.png"
rm -f "$JAR"
