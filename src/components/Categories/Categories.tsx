import './Categories.css';

function CategoryItem(props: { src: string; text: string }) {
  return (
    <a className="category" href="">
      <div className="category-img">
        <img src={props.src} alt={`${props.text} image`} />
      </div>
      <h3>{props.text}</h3>
    </a>
  );
}

/*props: list of categories*/
function Categories() {
  return (
    <div className="categories">
      <h1>Product Categories</h1>
      <div className="category-container">
        <CategoryItem
          key="Resistors"
          src="src\assets\resistor.svg"
          text="Resistors"
        />
        <CategoryItem
          key="Capacitors"
          src="src\assets\capacitor.svg"
          text="Capacitors"
        />
        <CategoryItem key="Diodes" src="src\assets\diode.svg" text="Diodes" />
        <CategoryItem
          key="Transistors"
          src="src\assets\transistor.svg"
          text="Transistors"
        />
        <CategoryItem key="ICs" src="src\assets\ic.svg" text="ICs" />
        <CategoryItem
          key="Connectors"
          src="src\assets\connector.svg"
          text="Connectors"
        />
        <CategoryItem
          key="Switches"
          src="src\assets\switch.svg"
          text="Switches"
        />
        <CategoryItem
          key="Sensors"
          src="src\assets\sensor.svg"
          text="Sensors"
        />
        <CategoryItem key="LEDs" src="src\assets\led.svg" text="LEDs" />
        <CategoryItem
          key="Displays"
          src="src\assets\display.svg"
          text="Displays"
        />
      </div>
    </div>
  );
}

export default Categories;
