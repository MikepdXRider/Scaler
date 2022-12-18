export default class Scaler {
  //assigned in constructor
  source;
  data;
  range;
  length;
  sum;
  sorted;
  firstQuartile;
  thirdQuartile;
  mean;
  standardDeviation;
  median;
  max;
  min;
  interQuartileRange;

  constructor(sourceData, range, options = { dataKey: null }) {
    // error handle
    if (!sourceData || !sourceData.length) {
      throw new Error("sourceData must be an array containing values");
    }
    if (
      !range.max ||
      !range.min ||
      typeof range.max !== "number" ||
      typeof range.min !== "number"
    ) {
      throw new Error(
        "range must be an object containing min and max Number values."
      );
    }

    // handle assignment
    if (options.dataKey) {
      this.data = sourceData.map((item) => item[options.dataKey]);
    } else {
      this.data = sourceData;
    }
    this.source = sourceData;
    this.range = range;
    this.processData(this.source);
  }

  static findStandardDeviation(data, mean) {
    const meanOffsets = data.map((value) => Math.abs(value - mean));
    const squared = meanOffsets.map((value) => Math.pow(value, 2));
    const meanOfSquared =
      squared.reduce((prev, curr) => prev + curr, 0) / data.length;
    const standardDeviation = Math.sqrt(meanOfSquared);
    return standardDeviation;
  }

  static processData(data) {
    this.length = data.length;
    this.sum = data.reduce((prev, curr) => prev + curr, 0);
    this.sorted = [...data].sort((a, b) => a - b);
    this.firstQuartile = sorted[Math.floor(this.length / 4)];
    this.thirdQuartile = sorted[Math.ceil(this.length * (3 / 4))];
    this.mean = this.sum / this.length;
    this.standardDeviation = this.findStandardDeviation(data, this.mean);
    this.median = this.sorted[Math.floor(this.length / 2)];
    this.max = Math.max(...data);
    this.min = Math.min(...data);
    this.interQuartileRange = this.thirdQuartile - this.firstQuartile;
  }

  // https://machinelearningmastery.com/robust-scaler-transforms-for-machine-learning/
  standardizeData() {
    const { source, mean, standardDeviation } = this;
    return source.map((value) => (value - mean) / standardDeviation);
  }

  currentScaler() {
    const { sorted, range, max } = this;
    return sorted.map((item) => (item / max) * range.max);
  }

  // https://en.wikipedia.org/wiki/Feature_scaling
  scaleToRange() {
    const { sorted, min, max, range } = this;
    return sorted.map(
      (currValue) =>
        ((currValue - min) * (range.max - range.min)) / (max - min) + range.min
    );
  }

  robustScale() {
    const { sorted, median, interQuartileRange } = this;
    return sorted.map((currValue) => (currValue - median) / interQuartileRange);
  }

  meanNormalization() {
    const { mean, sorted, max, min } = this;
    // can remove (max - min)
    return sorted.map((currValue) => (currValue - mean) / (max - min));
  }

  minMaxScaler() {
    const { min, max, sorted, range } = this;
    return sorted.map((currVal) => ((currVal - min) / (max - min)) * range.max);
  }
}
