import React from "react";
import Image from "next/image";
import dirhamIcon from "../custompages/icon.png";

export function UaeDirhamIcon({ size = 14, alt = "UAE Dirham Icon" }) {
  return <Image src={dirhamIcon} width={size} height={size} alt={alt} />;
}

export default UaeDirhamIcon;
