import { Layout, GoalList, Timer } from '../shared';

const Home = () => (
  <Layout>
    <h2>Home Page</h2>
    <div>
      <Goals />
      <Timers />
    </div>
  </Layout>
);

const Goals = () => (
  <div style={{display: "inline-block", padding: 20}}>
    <h3>Today's Goals</h3>
    <GoalList goals={[{content: "Research now", complete: false}, {content: "Research later", complete: true}]}></GoalList>
  </div>
);

const Timers = () => (
  <div style={{display: "inline-block", padding: 20}}>
    <h3>Timers</h3>
    <Timer name="Study"/>
  </div>
);
  
export default Home;
