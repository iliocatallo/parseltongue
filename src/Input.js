export class Input {
  constructor(value, progress = 0) {
    this.value = value;
    this.progress = progress;
  }

  isEmpty() {
    return this.value.length == 0;
  }

  top() {
    return this.value.charAt(0);
  }

  tail() {
    return new Input(this.value.substring(1), this.progress + 1);
  }
}
