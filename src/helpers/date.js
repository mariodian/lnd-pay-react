interface Date {
  addMinutes(): number;
}

Date.prototype.addMinutes = function(h) {
  this.setTime(this.getTime() + (h*60*1000));
  return this;
}

export default Date