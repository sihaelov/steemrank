
export default {
  methods: {
    formatNumber(valueInt) {
      let valueStr = valueInt.toString();
      if (valueStr.length > 6) {
        valueStr = `${Number((valueInt / 1000000).toFixed(2))}M`;
      } else if (valueStr.length > 3) {
        valueStr = `${(valueInt / 1000).toFixed()}k`;
      }
      return valueStr;
    },
  },
};
