import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: 20,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            backgroundColor: "white",
            transform: "rotate(45deg)",
            borderRadius: "12px 0 12px 0",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
