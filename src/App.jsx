import './App.css'
import DashboardContent from './combinedComponents/DashboardContent'
import IconDescBtn from './components/IconDescBtn'
import StatsCard from './components/StatsCard'
import WelcomeHeader from './components/WelcomeHeader'
import MainPage from './pages/MainPage'
import {BrowserRouter as Router} from 'react-router'

function App() {

  return (
    // <div className='
    // flex
    // justify-between
    // '
    // >
    //   <WelcomeHeader/>
    //   <IconDescBtn/>
    //   <StatsCard/>
    // </div>
    <Router>
      <MainPage/>
    </Router>
  )
}

export default App
