import { Layout, GoalList } from '../shared';

const Home = () => (
  <Layout>
    <p>Home Page</p>
    <Goals />
  </Layout>
);

const Goals = () => (
  <div>
    <h1>Today's Goals</h1>
    <GoalList goals={[{content: "Research now", complete: false}, {content: "Research later", complete: true}]}></GoalList>
  </div>
);

const Timers = () => (
  <div>
    
  </div>
);
  
export default Home;
