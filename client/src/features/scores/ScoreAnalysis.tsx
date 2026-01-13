import React, { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchRubric, selectRubric, selectRubricProfilesById, selectWeightByWeightId } from '../rubric/rubricSlice'
import { fetchScoresForRubricId, selectScoresForRubric } from './scoreSlice'
import ScoreSummary from './ScoreSummary'

const ScoreAnalysis = () => {
  const dispatch = useAppDispatch()
  const { rubricId } = useParams()

  const rubric = useAppSelector(selectRubric)
  const calculationsByScoreNameUserWeight = useAppSelector(selectScoresForRubric)
  const weightById = useAppSelector(selectWeightByWeightId)
  const profileById = useAppSelector(selectRubricProfilesById)

  useEffect(() => {
    if (rubricId) {
      dispatch(fetchRubric(rubricId))
      dispatch(fetchScoresForRubricId(rubricId))
    }
  }, [rubricId])

  const uniqueScoreNames: string[] = useMemo(() => {
    return Array.from(Object.keys(calculationsByScoreNameUserWeight))
  }, [calculationsByScoreNameUserWeight])

  return rubric
    ? (
    <div className='col-md-10 offset-md-1'>
      <div className='row text-center'>
        <div className='col'>
          <Link className='btn btn-link p-1' to={`/rubrics/${rubric.id}/scores/new`}>Score</Link>
          <Link className='btn btn-link p-1' to={`/calibrations/${rubric.id}/edit`}>Calibrate</Link>
          <Link className='btn btn-link p-1' to={`/rubrics/${rubric.id}/calibration-results`}>Results</Link>
          <Link className='btn btn-link p-1' to={`/rubrics/${rubric.id}/edit`} title='Edit'>Edit</Link>
        </div>
      </div>
      <header><h1 className='text-center'>Analysis for {rubric.name}</h1></header>
      {uniqueScoreNames.map((scoreName) => (
        <ScoreSummary
          key={scoreName}
          calculationsByUserWeight={calculationsByScoreNameUserWeight[scoreName] ?? {}}
          profileById={profileById}
          scoreName={scoreName}
          weightById={weightById}
          rubric={rubric}
        />
      ))}
    </div>
      )
    : <div>Loading...</div>
}

export default ScoreAnalysis
