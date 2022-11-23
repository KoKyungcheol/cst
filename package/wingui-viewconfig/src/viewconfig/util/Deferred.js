class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.res = resolve;
      this.rej = reject;
    });
  }

  resolve() {
    this.res();
  }

  reject() {
    this.rej();
  }

  done(callback) {
    this.promise.then(callback);
  }

  then(callback) {
    this.promise.then(callback);
  }
}

export default Deferred;
