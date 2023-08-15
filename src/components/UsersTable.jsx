import Papa from 'papaparse';
import React, { useEffect, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import '../index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { Faker, en, ka_GE, en_US, pl } from '@faker-js/faker';

function UsersTable() {
  const [region, setRegion] = useState('USA');
  const [errorRate, setErrorRate] = useState(0);
  const [userData, setUserData] = useState([]);
  const [seed, setSeed] = useState(42);

  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    generateRandomUserData();
  }, []);

  const generateRandomSeed = (str) => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    setSeed(randomSeed);
    generateRandomUserData('onclick');
  };

  const generateRandomUserData = (str) => {
    if (str === 'onclick') {
      setUserData([]);
    }

    const data = [];
    const recordsPerPage = page === 1 ? 20 : 10;
    const seedForPage = seed + Math.floor(userData.length / recordsPerPage);
    console.log('SEEED', seedForPage);
    let fakerInstance;

    if (region === 'USA') {
      fakerInstance = new Faker({
        locale: [en_US, en],
      });
    } else if (region === 'Poland') {
      fakerInstance = new Faker({
        locale: [pl, en],
      });
    } else if (region === 'Georgia') {
      fakerInstance = new Faker({
        locale: [ka_GE, en],
      });
    }

    if (str === 'onclick') {
      for (let i = 0; i < 20; i++) {
        const userId = uuidv4();

        const firstName = fakerInstance.person.firstName();
        const lastName = fakerInstance.person.lastName();
        const fullName = `${firstName} ${lastName}`;

        const city = fakerInstance.location.city();
        const street = fakerInstance.location.street();
        const buildingNumber = fakerInstance.location.buildingNumber(999);
        const address = `${city}, ${street} ${buildingNumber}`;
        const phone = fakerInstance.phone.number();

        let nameWithError = applyErrors(fullName);
        data.push({ userId, fullName, address, phone });
      }
    } else {
      for (let i = 0; i < 10; i++) {
        const userId = uuidv4();

        const firstName = fakerInstance.person.firstName();
        const lastName = fakerInstance.person.lastName();
        const fullName = `${firstName} ${lastName}`;

        const city = fakerInstance.location.city();
        const street = fakerInstance.location.street();
        const buildingNumber = fakerInstance.location.buildingNumber(999);
        const address = `${city}, ${street} ${buildingNumber}`;
        const phone = fakerInstance.phone.number();

        let nameWithError = applyErrors(fullName);
        data.push({ userId, fullName, address, phone });
        console.log('dataaaa', data);
      }
    }

    setUserData((prevData) => [...prevData, ...data]);
  };

  const handleScroll = () => {
    const scrollThreshold = 100;
    const scrolledToBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - scrollThreshold;

    if (scrolledToBottom && !isLoading) {
      setIsLoading(true);
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        generateRandomUserData();
        setIsLoading(false);
      }, 1000);
    }
  }, [isLoading]);

  const applyErrors = (text, currentErrorRate) => {
    if (currentErrorRate === 0) {
      return text;
    }

    let modifiedText = text;

    modifiedText = modifiedText.replace(/\[\[error\]\]/g, '');

    const errorCount = Math.floor(currentErrorRate * 2);
    for (let j = 0; j < errorCount; j++) {
      const errorType = Math.floor(Math.random() * 3);
      const errorPosition = Math.floor(Math.random() * modifiedText.length);

      switch (errorType) {
        case 0:
          if (modifiedText.length > 0) {
            modifiedText =
              modifiedText.slice(0, errorPosition) +
              modifiedText.slice(errorPosition + 1);
          }
          break;
        case 1:
          const randomChar = faker.string.alphanumeric();
          modifiedText =
            modifiedText.slice(0, errorPosition) +
            randomChar +
            modifiedText.slice(errorPosition);
          break;
        case 2:
          if (errorPosition < modifiedText.length - 1) {
            modifiedText =
              modifiedText.slice(0, errorPosition) +
              modifiedText.slice(errorPosition + 1);
          }
          break;
        default:
          break;
      }
    }

    return modifiedText;
  };

  const exportToCSV = () => {
    const csvData = [];
    csvData.push(['Index', 'ID', 'Name', 'Address', 'Phone']);

    userData.forEach((user, index) => {
      csvData.push([
        index + 1,
        user.userId,
        user.fullName,
        user.address,
        user.phone,
      ]);
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'user_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2>Users</h2>
        <div>
          <label htmlFor="region">Select Region: </label>{' '}
          <select
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="USA">USA</option>
            <option value="Poland">Poland</option>
            <option value="Georgia">Georgia</option>
          </select>
        </div>
        <div>
          <button onClick={generateRandomSeed}>Random Seed</button>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value))}
          />
        </div>

        <div>
          <label htmlFor="errorRate">Error Rate:</label>
          <input
            type="range"
            id="errorsrate"
            name="errorsrate"
            step="0.5"
            min="0"
            max="10"
            value={errorRate}
            onChange={(e) => {
              const newErrorRate = parseFloat(e.target.value);
              setErrorRate(newErrorRate);
              setUserData((prevData) =>
                prevData.map((user) => ({
                  ...user,
                  fullName: applyErrors(user.fullName, newErrorRate),
                  address: applyErrors(user.address, newErrorRate),
                  phone: applyErrors(user.phone, newErrorRate),
                }))
              );
            }}
          />
          <input
            type="number"
            min="0"
            step="0.5"
            max="10"
            value={errorRate}
            onChange={(e) => {
              const newErrorRate = parseFloat(e.target.value);
              setErrorRate(newErrorRate);
              setUserData((prevData) =>
                prevData.map((user) => ({
                  ...user,
                  fullName: applyErrors(user.fullName, newErrorRate),
                  address: applyErrors(user.address, newErrorRate),
                  phone: applyErrors(user.phone, newErrorRate),
                }))
              );
            }}
          />
        </div>
        <button onClick={() => generateRandomUserData('onclick')}>
          Generate Random Data
        </button>
        <button onClick={exportToCSV}>Export to CSV</button>
      </div>
      <Table striped bordered hover className="mt-2">
        <thead>
          <tr>
            <th>Index</th>
            <th>ID</th>
            <th>Name</th>
            <th>Address</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {userData.map((user, index) => (
            <tr key={user.userId}>
              <td>{index + 1}</td>
              <td>{user.userId}</td>
              <td>{user.fullName}</td>
              <td>{user.address}</td>
              <td>{user.phone}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default UsersTable;
