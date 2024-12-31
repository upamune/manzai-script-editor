import { Switch, Route } from "wouter";
import { Home } from "@/pages/Home";
import { Preview } from "@/pages/Preview";

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/preview" component={Preview} />
    </Switch>
  );
}

export default App;
