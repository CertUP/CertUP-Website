interface Props {
  height: number;
}

export default function Spacer({ height = 10 }: Props) {
  return <div style={{ paddingTop: `${height}px` }} />;
}
