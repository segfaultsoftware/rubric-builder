import React from 'react'

import { type Weight } from '../../types/Weight'

interface WeightScoreProps {
  weight: Weight
  rating: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const WeightScore = ({ weight, rating, onChange }: WeightScoreProps) => {
  const inputName = `checkbox:${weight.name}`
  const options: number[] = new Array(6).fill(0)

  return (
    <div>
      <div className='mb-1 text-center'>
        {weight.imageUrl && (
          <img
            src={weight.imageUrl}
            alt={weight.name}
            style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }}
            className='mb-2'
          />
        )}
        <div>{weight.name}</div>
      </div>
      <div className='row mb-3'>
        <div className='col-md-3'></div>
        {options.map((_, value) => {
          return (
            <div key={value} className='col-2 col-md-1 form-check'>
              <label className='form-check-label'>
                {value}
                <input
                  type='radio'
                  name={inputName}
                  value={value}
                  checked={value === rating}
                  onChange={onChange}
                  className='form-check-input'
                />
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WeightScore
