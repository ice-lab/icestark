window.test_02_state = (() => {
  var React = window.react;
  return {
    __esModule: true,
    default(props = {}) {
      var value = props.value;
      var initialValue = React.useState(value)[0];
      return React.createElement("span", null, value, ", initial: ", initialValue);
    }
  }
})();
