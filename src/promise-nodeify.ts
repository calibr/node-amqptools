export function promiseNodeify(promise, nodeback) {
  if (nodeback) {
    promise.then((value) => {
      setTimeout(() => {
        nodeback(null, value);
      }, 0);
    }, (error) => {
      setTimeout(() => {
        nodeback(error);
      }, 0);
    });
  } else {
    return promise;
  }
}