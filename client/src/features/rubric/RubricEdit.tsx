import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchRubric, type Rubric, selectRubric, updateRubric } from './rubricSlice'
import { useParams } from 'react-router-dom'
import RubricForm from './RubricForm'
import { selectLoggedInAs } from '../profile/profileSlice'
import RubricMembers from './RubricMembers'

const RubricEdit = () => {
  const dispatch = useAppDispatch()
  const fetchedRubric = useAppSelector(selectRubric)
  const author = useAppSelector(selectLoggedInAs)
  const { rubricId } = useParams()
  const [rubric, setRubric] = useState<Rubric>({
    name: '', weights: [], members: []
  })

  useEffect(() => {
    if (rubricId) {
      dispatch(fetchRubric(rubricId))
    }
  }, [rubricId])

  useEffect(() => {
    if (fetchedRubric) {
      setRubric(fetchedRubric)
    }
  }, [fetchedRubric])

  const handleSubmit = (modifiedRubric: Rubric) => {
    dispatch(updateRubric(modifiedRubric))
  }

  return author
    ? (
    <>
      <header><h1>Edit a Rubric</h1></header>
      <RubricForm
        author={author}
        rubric={rubric}
        onRubricChange={setRubric}
        onSubmit={handleSubmit}
      />
      <RubricMembers />
    </>
      )
    : (
    <div>
      Need to be logged in to edit rubrics.
    </div>
      )
}

export default RubricEdit
