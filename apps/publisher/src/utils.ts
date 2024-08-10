export async function Delay(ms: number): Promise<void> {
      return new Promise(res => setTimeout(res, ms));
}

export class DeferedPromise<T> {
      promise: Promise<T>;
      resolve: ((value: T) => void) | undefined;

      constructor() {
            this.promise = new Promise<T>((resolve) => {
                  this.resolve = resolve;
            });
      }
}

export class AwaitedInterval {
      private isStop = false;
      private isRun = false;
      private stopPomise: DeferedPromise<void> = new DeferedPromise();

      constructor(
            private durationInMilliseconds: number,
            private callBack: () => Promise<unknown>,
      ) {
            this.run.bind(this)();
      }

      private async run(): Promise<void> {
            if (this.isRun)
                  return;

            this.isRun = true;

            while (!this.isStop) {
                  const start = Date.now();

                  try {
                        await this.callBack();
                  } finally {
                        const duration = Date.now() - start;

                        if (duration < this.durationInMilliseconds) {
                              const timeToSleep = this.durationInMilliseconds - duration;

                              if (timeToSleep > 0)
                                    await Delay(timeToSleep);
                        }

                        continue;
                  }
            }

            this.stopPomise.resolve?.();
            this.isRun = false;
      }

      /**
       * Остановка интервала
       */
      async stop(): Promise<void> {
            this.isStop = true;
            await this.stopPomise.promise;
            this.isStop = false;
            this.stopPomise = new DeferedPromise();
      }


      /**
      * Запуск интервала
      */
      start(): void {
            this.run.bind(this)();
      }
}
