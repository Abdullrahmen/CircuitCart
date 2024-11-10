import './NavBar.css';

function NavLinkItem(props: { text: string; link: string }) {
    return (
        <li className="navitem">
            <a href={props.link}>{props.text}</a>
        </li>
    );
}

function NavSignItem(props: { text: string; link: string }) {
    return (
        <li className="navitem">
            <a href={props.link}>
                <button className="btn">{props.text}</button>
            </a>
        </li>
    );
}

function NavIconItem(props: { src: string; link: string }) {
    return (
        <li className="navitem">
            <a href={props.link}>
                <img src={props.src} alt="icon" />
            </a>
        </li>
    );
}

function NavBar() {
    return (
        <div className="navbar">
            <div className="container">
                <a className="nav-left">
                    <img src="src\assets\Logo.png" alt="logo" />
                </a>
                <nav className="nav-center">
                    <ul className="nav-links">
                        <NavLinkItem key="About" text="About" link="/about" />
                        <NavLinkItem
                            key="Products"
                            text="Products"
                            link="/products"
                        />
                        <NavLinkItem
                            key="Contact"
                            text="Contact"
                            link="/contact"
                        />
                        <NavLinkItem
                            key="Track Order"
                            text="Track Order"
                            link="/track"
                        />
                    </ul>
                </nav>
                <div className="nav-right">
                    <ul className="icons-container">
                        <NavIconItem src="src\assets\cart.svg" link="/cart" />
                        <NavIconItem
                            src="src\assets\profile.svg"
                            link="/profile"
                        />
                    </ul>

                    <ul className="sign-container">
                        <NavSignItem key="Login" text="Login" link="/login" />
                        <NavSignItem
                            key="Sign Up"
                            text="Sign Up"
                            link="/signup"
                        />
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default NavBar;
