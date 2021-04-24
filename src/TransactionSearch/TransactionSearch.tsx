/* eslint-disable prettier/prettier */
import React from 'react';
import axios, { CancelTokenSource } from 'axios';
import './TransactionSearch.css';

interface ITransactions {
  transactions : ITransaction[]
}

interface ITransaction {
  blockHash: string,
  blockNumber: number,
  gas: number,
  hash: string,
  from: string,
  to: string,
  value: number
}

const defaultTrans: ITransactions = { transactions : []};

const TransactionSearch  = () => {
  const [blockNumber, changeBlockNumber] = React.useState("9148873");
  const [address, changeAddress] = React.useState("0xc55eddadeeb47fcde0b3b6f25bd47d745ba7e7fa");
  const [searchResponse, setSearchResponse]: [ITransactions, (trans: ITransactions) => void] = React.useState(defaultTrans);
  const [loading, setLoading]: [boolean,(loading: boolean) => void ] = React.useState<boolean>(true);
  const [error, setError]: [string, (error: string) => void] = React.useState('');

  const handleBlockNumberChange = (event: { target: { value: string; }; }) => {
    changeBlockNumber(event.target.value);
  }

  const handleAddressChange = (event: { target: { value: string; }; }) => {
    changeAddress(event.target.value);
  }

  const cancelToken = axios.CancelToken; //create cancel token
  const [cancelTokenSource, setCancelTokenSource]: [
    CancelTokenSource,
    (cancelTokenSource: CancelTokenSource) => void
  ] = React.useState(cancelToken.source());

  const handleCancelClick = () => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel('User cancelled operation');
    }
  };

  React.useEffect(() => {
    const url: string = "http://localhost:5000/api/transactions?blockNumber=" + blockNumber + "&address=" + address ;

    axios
      .get<ITransactions>(url, {
        cancelToken: cancelTokenSource.token,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      })
      .then((response) => {
        setSearchResponse(response.data);
        setLoading(false);
      })
      .catch((ex) => {
        const error = axios.isCancel(ex)
          ? 'Request Cancelled'
          : ex.code === 'ECONNABORTED'
          ? 'A timeout has occurred'
          : ex.response.status === 404
          ? 'Resource Not Found'
          : 'An unexpected error has occurred';

        setError(error);
        setLoading(false);
      });
  }, [blockNumber, address]);

  return (
    <div className="TransactionSearch">
        <h1>Search Transactions by block number and address</h1>
        <label htmlFor="blockNumberInput">Block number</label>
        <input type="text" id="blockNumberInput" name="blockNumber" placeholder="eg. 9148873" value={blockNumber} onChange={handleBlockNumberChange}/>
        <label htmlFor="addressInput">Address</label>
        <input type="text" id="addressInput" name="address" placeholder="eg. 0xc55eddadeeb47fcde0b3b6f25bd47d745ba7e7fa"  value={address} onChange={handleAddressChange}/>
      {loading && <button onClick={handleCancelClick}>Cancel</button>}
      <div>
      <h2>Search Results</h2>
      <table>
            <thead>
              <tr>
                <th>Block Hash</th>
                <th>Block Number</th>
                <th>Hash</th>
                <th>From</th>
                <th>To</th>
                <th>Gas</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {
                searchResponse.transactions.map((item, index) => {
                  return [
                    <tr key={index}>
                     <td>{item.blockHash}</td>
                     <td>{item.blockNumber}</td>
                     <td>{item.hash}</td>
                     <td>{item.from}</td>
                     <td>{item.to}</td>
                     <td>{item.gas}</td>
                     <td>{item.value}</td>
                    </tr>
                  ]
                })
              }
            </tbody>
          </table>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default TransactionSearch;
