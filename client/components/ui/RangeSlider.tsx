import React from 'react'

type Props = {
  min: number
  max: number
  step?: number
  valueMin: number
  valueMax: number
  onChange: (min: number, max: number) => void
  className?: string
}

export default function RangeSlider({ min, max, step = 1, valueMin, valueMax, onChange, className }: Props) {
  const clamp = (val: number, low: number, high: number) => Math.min(Math.max(val, low), high)

  const minPercent = ((valueMin - min) / (max - min)) * 100
  const maxPercent = ((valueMax - min) / (max - min)) * 100

  return (
    <div className={`relative h-6 ${className || ''}`}>
      {/* Track */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-[#e5e5e5]" />
      {/* Selected range */}
      <div
        className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-[#6c4323]"
        style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
      />

      {/* Min thumb */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={(e) => {
          const next = clamp(Number(e.target.value), min, valueMax)
          onChange(next, valueMax)
        }}
        className="absolute left-0 right-0 w-full h-6 appearance-none bg-transparent pointer-events-none z-20"
        aria-label="Minimum price"
      />
      {/* Max thumb */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={(e) => {
          const next = clamp(Number(e.target.value), valueMin, max)
          onChange(valueMin, next)
        }}
        className="absolute left-0 right-0 w-full h-6 appearance-none bg-transparent pointer-events-none z-10"
        aria-label="Maximum price"
      />

      <style jsx>{`
        input[type='range'] { 
          -webkit-appearance: none; 
          appearance: none; 
        }
        input[type='range']::-webkit-slider-thumb { 
          -webkit-appearance: none; 
          appearance: none; 
          height: 18px; 
          width: 18px; 
          border-radius: 9999px; 
          background: #ffffff; 
          border: 2px solid #6c4323; 
          box-shadow: 0 1px 2px rgba(0,0,0,0.08); 
          cursor: pointer; 
          pointer-events: all; 
          margin-top: -8px; 
        }
        input[type='range']::-moz-range-thumb { 
          height: 18px; width: 18px; border-radius: 9999px; background: #ffffff; border: 2px solid #6c4323; box-shadow: 0 1px 2px rgba(0,0,0,0.08); cursor: pointer; pointer-events: all; 
        }
        input[type='range']::-webkit-slider-runnable-track { height: 0; }
        input[type='range']::-moz-range-track { height: 0; }
      `}</style>
    </div>
  )
}


