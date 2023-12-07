import {useState, useEffect} from 'react'
import './index.css'

const StatisticsBox = () => {
  const [selectedMonth, setSelectedMonth] = useState('01') // Default month
  const [totalSaleAmount, setTotalSaleAmount] = useState(0)
  const [totalSoldItems, setTotalSoldItems] = useState(0)
  const [totalNotSoldItems, setTotalNotSoldItems] = useState(0)

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`/statistics/${selectedMonth}`)
      const data = await response.json()

      setTotalSaleAmount(data.total_sale_amount)
      setTotalSoldItems(data.total_sold_items)
      setTotalNotSoldItems(data.total_not_sold_items)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }
  useEffect(() => {
    fetchStatistics()
  }, [selectedMonth])

  const handleMonthChange = e => {
    setSelectedMonth(e.target.value)
  }

  return (
    <div className="background">
      <h2>Transactions Statistics</h2>
      <label htmlFor="monthSelect">Select Month:</label>
      <select
        id="monthSelect"
        value={selectedMonth}
        onChange={handleMonthChange}
        className="select"
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

      <div className="second-bg">
        <h3>Statistics for {selectedMonth}</h3>
        <p>Total Sale Amount: {totalSaleAmount}</p>
        <p>Total Sold Items: {totalSoldItems}</p>
        <p>Total Not Sold Items: {totalNotSoldItems}</p>
      </div>
    </div>
  )
}

export default StatisticsBox
