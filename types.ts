export interface RadioStation {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  votes: number;
  codec: string;
  bitrate: number;
}

export interface CountryGeo {
  properties: {
    ADMIN: string;
    ISO_A2: string;
    WB_A3: string;
  };
  bbox: number[];
}

export interface CulturalInsight {
  text: string;
  loading: boolean;
}
