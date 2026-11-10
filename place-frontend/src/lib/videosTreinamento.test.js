import { describe, expect, it } from "vitest";
import { capaDoVideo, idDoYoutube, linkDoVideo, videosValidos } from "./videosTreinamento";

const ID = "dQw4w9WgXcQ";

describe("idDoYoutube", () => {
  it("lê os formatos comuns de link", () => {
    expect(idDoYoutube(`https://www.youtube.com/watch?v=${ID}&t=30`)).toBe(ID);
    expect(idDoYoutube(`https://youtu.be/${ID}?si=abc`)).toBe(ID);
    expect(idDoYoutube(`https://youtube.com/shorts/${ID}`)).toBe(ID);
    expect(idDoYoutube(`https://m.youtube.com/watch?v=${ID}`)).toBe(ID);
  });

  it("recusa http, outros sites e ids inválidos", () => {
    expect(idDoYoutube(`http://www.youtube.com/watch?v=${ID}`)).toBeNull();
    expect(idDoYoutube(`https://youtube.com.golpe.com/watch?v=${ID}`)).toBeNull();
    expect(idDoYoutube("https://www.youtube.com/watch?v=curto")).toBeNull();
    expect(idDoYoutube("javascript:alert(1)")).toBeNull();
    expect(idDoYoutube(undefined)).toBeNull();
  });
});

describe("linkDoVideo e capaDoVideo", () => {
  it("normaliza o YouTube e aceita arquivo do Drive", () => {
    expect(linkDoVideo(`https://youtu.be/${ID}`)).toBe(`https://www.youtube.com/watch?v=${ID}`);
    expect(linkDoVideo("https://drive.google.com/file/d/abc123/view")).toBe("https://drive.google.com/file/d/abc123/view");
    expect(linkDoVideo("https://drive.google.com/drive/folders/abc")).toBeNull();
    expect(linkDoVideo("https://vimeo.com/123")).toBeNull();
  });

  it("só o YouTube tem capa", () => {
    expect(capaDoVideo(`https://youtu.be/${ID}`)).toBe(`https://i.ytimg.com/vi/${ID}/hqdefault.jpg`);
    expect(capaDoVideo("https://drive.google.com/file/d/abc123/view")).toBeNull();
  });
});

describe("videosValidos", () => {
  it("descarta itens sem título ou com link inválido", () => {
    const lista = videosValidos([
      { id: "a", titulo: " Primeiro atendimento ", url: `https://youtu.be/${ID}` },
      { id: "b", titulo: "", url: `https://youtu.be/${ID}` },
      { id: "c", titulo: "Site estranho", url: "https://exemplo.com/video" },
    ]);
    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({ id: "a", titulo: "Primeiro atendimento", link: `https://www.youtube.com/watch?v=${ID}` });
    expect(videosValidos(null)).toEqual([]);
  });
});
