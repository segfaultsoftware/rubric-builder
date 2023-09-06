import React, {useEffect} from 'react'
import {Link} from "react-router-dom";
import {deleteRubric, fetchRubrics, Rubric, selectRubrics} from "./rubricSlice";
import {useAppDispatch, useAppSelector} from "../../app/hooks";

const RubricIndex = () => {
  const dispatch = useAppDispatch()
  const rubrics = useAppSelector(selectRubrics)

  useEffect(() => {
    dispatch(fetchRubrics())
  }, [])

  const handleDelete = (rubric: Rubric) => {
    dispatch(deleteRubric(rubric))
  }

  const rubricList = () => {
    return rubrics.map((rubric) => {
      return (
        <li key={rubric.id}>
          {rubric.name} &nbsp;
          <Link to={`/rubrics/${rubric.id}/scores/new`}>Score</Link> &nbsp;
          <Link to={`/rubrics/${rubric.id}/scores`}>Analyze</Link> &nbsp;
          <Link to={`/calibrations/edit/${rubric.id}`}>Calibrate</Link> &nbsp;
          <Link to={`/rubrics/edit/${rubric.id}`}>Edit</Link> &nbsp;
          <button type='button' onClick={() => handleDelete(rubric)}>Delete</button>
        </li>
      )
    })
  }

  return (
    <div>
      <span>Rubrics You Can See:</span>
      <ol>
        {rubricList()}
      </ol>
      <Link to={'/rubrics/new'}>Create Rubric</Link>
    </div>
  )
}

export default RubricIndex
