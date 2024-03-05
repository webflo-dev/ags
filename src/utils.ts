/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Binding } from "types/service";

type Dep<T> = Binding<any, any, T>;
export function merge<
  V,
  const Deps extends Dep<unknown>[],
  Args extends { [K in keyof Deps]: Deps[K] extends Dep<infer T> ? T : never },
>(deps: Deps, fn: (...args: Args) => V) {
  const update = () =>
    fn(...(deps.map((d) => d.transformFn(d.emitter[d.prop])) as Args));
  const watcher = Variable(update());
  for (const dep of deps)
    dep.emitter.connect(`notify::${Utils.kebabify(dep.prop)}`, () =>
      watcher.setValue(update())
    );

  return watcher.bind();
}
