import { useEffect, useRef } from 'react'
import styles from './WaveVisualizer.module.css'

export default function WaveVisualizer({ level = 0, isActive = false }) {
  const bars = 28

  return (
    <div className={`${styles.wave} ${isActive ? styles.active : ''}`}>
      {Array.from({ length: bars }).map((_, i) => {
        const center = bars / 2
        const dist = Math.abs(i - center) / center // 0 at edges, 1 at center — invert
        const proximity = 1 - dist
        const height = isActive
          ? 4 + proximity * level * 52 + Math.sin(i * 0.8 + Date.now() / 200) * level * 8
          : 4 + proximity * 10

        return (
          <div
            key={i}
            className={styles.bar}
            style={{
              height: `${Math.max(4, height)}px`,
              opacity: isActive ? 0.4 + proximity * 0.6 : 0.2 + proximity * 0.2,
            }}
          />
        )
      })}
    </div>
  )
}
