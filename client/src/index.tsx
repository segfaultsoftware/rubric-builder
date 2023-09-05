import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import {createBrowserRouter, RouterProvider} from "react-router-dom";

import { store } from './app/store';
import reportWebVitals from './reportWebVitals';
import RootLayout from "./RootLayout";
import RubricIndex from "./features/rubric/RubricIndex";
import HomePage from "./HomePage";
import RubricNew from "./features/rubric/RubricNew";
import RubricEdit from "./features/rubric/RubricEdit";
import CalibrationsEdit from "./features/calibrations/CalibrationsEdit";

import './index.css';

const container = document.getElementById('root')!;
const root = createRoot(container);
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'calibrations/edit/:rubricId',
        element: <CalibrationsEdit />
      },
      {
        path: 'rubrics',
        element: <RubricIndex />
      },
      {
        path: 'rubrics/new',
        element: <RubricNew />
      },
      {
        path: 'rubrics/edit/:rubricId',
        element: <RubricEdit />
      }
    ]
  }
])

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
