import {useEffect, useState} from 'react'
import './index.css'

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('01') // Default selected month is March
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchData = async () => {
    try {
      const response = await fetch(
        `/list_transactions/${currentPage}?search=${searchText}&month=${selectedMonth}`,
      )
      const data = await response.json()
      setTransactions(data.transactions)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedMonth, searchText, currentPage])

  const handleMonthChange = e => {
    setSelectedMonth(e.target.value)
  }

  const handleSearch = e => {
    setSearchText(e.target.value)
  }

  const handleSearchSubmit = () => {
    fetchData()
  }

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="main-bg">
      <h1 className="heading">Transactions DashBoard</h1>
      <div className="search-bg">
        <div>
          <label>
            Select Month:
            <select
              id="monthSelect"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            >
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">Aug</option>
              <option value="09">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            </select>
          </label>
        </div>
        <div>
          <input type="text" value={searchText} onChange={handleSearch} />
          <button onClick={handleSearchSubmit} type="button">
            Search
          </button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Date of Sale</th>
            <th>Sold</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>${transaction.price}</td>
              <td>{transaction.category}</td>
              <td>{transaction.dateOfSale}</td>
              <td>{transaction.sold}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="button-bg">
        <button onClick={handlePreviousPage}>Previous</button>
        <button onClick={handleNextPage}>Next</button>
      </div>
    </div>
  )
}

export default TransactionsPage
