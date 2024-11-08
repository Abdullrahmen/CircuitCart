import NavBar from '../NavBar/NavBar';
import './Header.css';

function HeaderText() {
    return (
        <div className="header-text">
            <h1>CircuitCart</h1>
            <p>E-commerce for electronic circuit components </p>
            <button>Shop Now</button>
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
            </div>
        </>
    );
}

export default Header;
