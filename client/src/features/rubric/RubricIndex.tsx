import React, {useEffect, useState} from 'react'
import {Link} from "react-router-dom";
import {fetchRubrics, Rubric, selectRubrics} from "./rubricSlice";
import {useAppDispatch, useAppSelector} from "../../app/hooks";

const RubricIndex = () => {
  const dispatch = useAppDispatch()
  const rubrics = useAppSelector(selectRubrics)

  useEffect(() => {
    dispatch(fetchRubrics())
  }, [])

  const rubricList = () => {
    return rubrics.map((rubric) => {
      return (
        <li key={rubric.id}>
          {rubric.name} &nbsp;
          <Link to={`/rubrics/edit/${rubric.id}`}>Edit</Link>
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
