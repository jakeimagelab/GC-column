import styles from "./LayerDiagram.module.css";

type LayerDiagramProps = {
  caption: string;
  showReview?: boolean;
};

export function LayerDiagram({ caption, showReview = false }: LayerDiagramProps) {
  const ultheraDots = [705, 735, 765, 795];

  return (
    <figure className={styles.figure}>
      <div className={styles.viewport}>
        <svg
          className={styles.diagram}
          viewBox="0 0 900 380"
          role="img"
          aria-labelledby="layer-diagram-title layer-diagram-desc"
        >
          <title id="layer-diagram-title">써마지·세르프·울쎄라 에너지 도달 층 비교</title>
          <desc id="layer-diagram-desc">표피, 진피층, 피하지방층, 근막층에 각 장비의 에너지가 주로 닿는 범위를 비교한 그림</desc>
          <defs>
            <linearGradient id="thermage-layer-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4A2878" stopOpacity=".85" />
              <stop offset="1" stopColor="#4A2878" stopOpacity=".15" />
            </linearGradient>
            <linearGradient id="xerf-layer-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F4ABA2" stopOpacity=".95" />
              <stop offset="1" stopColor="#F4ABA2" stopOpacity=".25" />
            </linearGradient>
          </defs>

          <rect width="900" height="380" fill="#fff" />
          <rect x="120" y="60" width="760" height="40" fill="#F3E7DF" />
          <rect x="120" y="100" width="760" height="120" fill="#F7EFE7" />
          <rect x="120" y="220" width="760" height="80" fill="#F4E5C9" />
          <rect x="120" y="300" width="760" height="40" fill="#E9D5C7" />

          <g className={styles.layerLabels} fill="#766E66" fontSize="13">
            <text x="24" y="85">표피</text>
            <text x="24" y="166">진피층</text>
            <text x="24" y="266">피하지방층</text>
            <text x="24" y="326">근막층</text>
          </g>

          <g className={styles.deviceLabels} fill="#3A3028" fontSize="15" fontWeight="500" textAnchor="middle">
            <text x="250" y="36">써마지</text>
            <text x="500" y="36">세르프</text>
            <text x="750" y="36">울쎄라</text>
          </g>

          <rect x="190" y="100" width="120" height="120" fill="url(#thermage-layer-gradient)" />
          <rect x="440" y="100" width="120" height="120" fill="url(#xerf-layer-gradient)" />
          <rect x="440" y="220" width="120" height="120" fill="#F4ABA2" fillOpacity=".22" />

          <g fill="#F2C12E">
            {ultheraDots.map((x) => <circle cx={x} cy="262" key={`fat-${x}`} r="6" />)}
            {ultheraDots.map((x) => <circle cx={x} cy="320" key={`fascia-${x}`} r="6" />)}
          </g>

          <g className={styles.notes} fill="#766E66" fontSize="12" textAnchor="middle">
            <text x="250" y="364">6.78MHz · 진피층까지</text>
            <text x="500" y="364">DEEP 모드 2MHz · 넓은 면적으로 더 깊게</text>
            <text x="750" y="364">초음파 · 좁은 라인으로 선택적으로</text>
          </g>
        </svg>
      </div>
      <figcaption>
        <span>{caption}</span>
        {showReview ? <b>원장 확인</b> : null}
      </figcaption>
    </figure>
  );
}
