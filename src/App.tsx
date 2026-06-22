import { Routes,Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { IdiomList } from './pages/IdiomList'
import { IdiomDetail } from './pages/IdiomDetail'
import { Quiz } from './pages/Quiz'
export default function App(){return <Routes><Route element={<Layout/>}><Route index element={<Home/>}/><Route path="idioms" element={<IdiomList/>}/><Route path="idioms/:id" element={<IdiomDetail/>}/><Route path="quiz" element={<Quiz/>}/><Route path="*" element={<Home/>}/></Route></Routes>}
