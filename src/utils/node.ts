export const node = {
  buildNode(
    labels: string[] | readonly string[],
    properties: Record<string, any>,
    varName: string = 'n'
  ) {
    const propsKeys = Object.keys(properties);
    const parameterKeys = propsKeys.map(k => `${varName}${k}`);
    const parametersObj: any /*MappedParameters<Properties, typeof varName>*/ =
      {};
    parameterKeys.forEach(
      (pk, i) => (parametersObj[pk] = properties[propsKeys[i]])
    );
    const keys = propsKeys.map(k => `${k}: \$${varName}${k}`);
    const props = keys.length === 0 ? '' : ` {${keys.join(',')}}`;
    const nodeStr = `(${varName.trim()}:${labels.join(':')}${props})`;
    return [nodeStr, parametersObj] as const;
  },
};
