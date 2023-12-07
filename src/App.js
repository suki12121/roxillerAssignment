import './App.css'
import BarChartComponent from './components/BarChartComponent'
import TransactionsPage from './components/TransactionPage'
import StatisticsBox from './components/StatisticsBox'

function App() {
  return (
    <div className="App">
      <TransactionsPage />
      <StatisticsBox />
      <BarChartComponent />
    </div>
  )
}

export default App
