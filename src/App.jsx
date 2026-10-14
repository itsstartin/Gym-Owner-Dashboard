import './App.css'
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
