import React, { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { createRubric } from './rubricSlice'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectLoggedInAs } from '../profile/profileSlice'
import RubricForm from './RubricForm'
import { type Rubric, RubricVisibility } from '../../types/Rubric'

const RubricNew = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const author = useAppSelector(selectLoggedInAs)

  const [rubric, setRubric] = useState<Rubric>({
    name: '',
    descriptor: '',
    visibility: RubricVisibility.MembersOnly,
    weights: [{
      id: 0,
      name: '',
      profileWeights: [],
      _new: true
    }],
    members: []
  })

  const handleSubmit = async (newRubric: Rubric) => {
    const response = await dispatch(createRubric(newRubric))
    navigate(`/rubrics/${(response.payload as Rubric).id}/edit`)
  }

  return author
    ? (
    <div className='text-center col-lg-6 offset-lg-3'>
      <header><h1>Create a Rubric</h1></header>
      <RubricForm
        author={author}
        rubric={rubric}
        onRubricChange={setRubric}
        onSubmit={handleSubmit}
      />
    </div>
      )
    : (
    <div>
      Loading...
    </div>
      )
}

export default RubricNew
