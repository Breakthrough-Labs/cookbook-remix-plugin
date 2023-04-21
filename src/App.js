import axios from "axios";
import "./App.css";
import { CookbookPlugin } from "./components/CookbookPlugin";

axios.defaults.baseURL = "https://simple-web3-api.herokuapp.com";

function App() {
  return <CookbookPlugin />;
}

export default App;
