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
  <div style={{display: "inline-block", width: '40%', 'vertical-align': 'top', 'margin-right': 35, 'padding-right': 15, 'border-right': '2px solid #DDD'}}>
    <h3>Today's Goals</h3>
    <GoalList goals={[{content: "Research now", complete: false}, {content: "Research later", complete: true}]}></GoalList>
  </div>
);

const Timers = () => (
  <div style={{display: "inline-block", width: '40%', 'vertical-align': 'top'}}>
    <h3>Timers</h3>
    <Timer name="Study"/>
  </div>
);
  
export default Home;
