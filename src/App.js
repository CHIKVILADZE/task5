import React, { useState } from 'react';
import { faker } from '@faker-js/faker';
import './App.css';
import UsersTable from './components/UsersTable';

function App() {
  return (
    <div className="App">
      <UsersTable />
    </div>
  );
}

export default App;
