import {useState, useEffect} from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import './index.css'

const BarChartComponent = () => {
  const [selectedMonth, setSelectedMonth] = useState('01') // Default month
  const [chartData, setChartData] = useState([])

  const fetchBarChartData = async () => {
    try {
      const response = await fetch(`/bar_chart_data/${selectedMonth}`)
      const data = await response.json()

      // Process the data for Recharts format
      const chartData1 = [
        {range: '0 - 100', items: data.range_0_100},
        {range: '101 - 200', items: data.range_101_200},
        {range: '201 - 300', items: data.range_201_300},
        {range: '301 - 400', items: data.range_301_400},
        {range: '401 - 500', items: data.range_401_500},
        {range: '501 - 600', items: data.range_501_600},
        {range: '601 - 700', items: data.range_601_700},
        {range: '701 - 800', items: data.range_701_800},
        {range: '801 - 900', items: data.range_801_900},
        {range: '901 - above', items: data.range_901_above},
      ]

      setChartData(chartData1)
    } catch (error) {
      console.error('Error fetching bar chart data:', error)
    }
  }

  useEffect(() => {
    fetchBarChartData()
  }, [selectedMonth])

  const handleMonthChange = e => {
    setSelectedMonth(e.target.value)
  }

  return (
    <div>
      <h2 className="bar-heading">Transactions Bar Chart {selectedMonth}</h2>
      <label htmlFor="monthSelect" className="bar-heading1">
        Select Month:
      </label>
      <select
        id="monthSelect"
        value={selectedMonth}
        onChange={handleMonthChange}
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

      <div style={{width: '1000px', height: '400px'}} className="bar-bg">
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{top: 20, right: 30, left: 20, bottom: 5}}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="items" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default BarChartComponent
