import Categories from '../../components/Categories/Categories';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import './Home.css';

function Home() {
  return (
    <div className="homePage">
      <Header />
      <Categories />
      <Footer />
    </div>
  );
}

export default Home;
