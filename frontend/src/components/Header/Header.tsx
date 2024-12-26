import NavBar from '../NavBar/NavBar';
import './Header.css';

function HeaderText() {
  return (
    <div className="header-text">
      <h1>CircuitCart</h1>
      <p>E-commerce for electronic circuit components </p>
      <p>Get your electronic components at the best prices</p>
      <button className="btn">Shop Now</button>
      {/* <div className="loader"></div> */}
    </div>
  );
}

function HeaderImage() {
  return (
    <div className="header-image">
      <img src="src\assets\HeaderImage.png" alt="Circuit image" />
    </div>
  );
}

function Header() {
  return (
    <>
      <NavBar />
      <div className="header">
        <div className="header-container">
          <HeaderText />
          <HeaderImage />
        </div>
        {/*Todo <svg wave> https://svgwave.in/
				blog.logrocket.com/create-wavy-background-using-css-svg/*/}
      </div>
    </>
  );
}

export default Header;
