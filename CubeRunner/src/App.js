import React from 'react';
import Game from './components/Game';
import './index.css'
import { Routes, Route} from "react-router-dom";

const App = () =>{
    return(
        <>
        <div>
            <Routes>
                <Route path ='/' element = {<Game />}></Route>
            </Routes>
            </div>
        </>
    )
}

export default App