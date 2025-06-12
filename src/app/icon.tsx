import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "#0891b2",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "50%",
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            backgroundColor: "white",
            transform: "rotate(45deg)",
            borderRadius: "2px 0 2px 0",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
