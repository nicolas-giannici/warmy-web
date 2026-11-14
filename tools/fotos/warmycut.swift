// warmycut: prolija fotos de tejidos.
//  - mode=cutout: recorta el objeto con Vision y lo compone sobre un canvas fijo.
//  - mode=frame:  encuadra la foto (cover) con margen uniforme.
import Foundation
import Vision
import CoreImage
import AppKit

// MARK: - args

var opts: [String: String] = [:]
var positional: [String] = []
var it = CommandLine.arguments.dropFirst().makeIterator()
while let a = it.next() {
    if a.hasPrefix("--") {
        let key = String(a.dropFirst(2))
        if let v = it.next() { opts[key] = v } else { opts[key] = "1" }
    } else {
        positional.append(a)
    }
}
guard positional.count >= 2 else {
    FileHandle.standardError.write("usage: warmycut in out [--mode cutout|frame] [--crop x,y,w,h] [--bg ffffff|none] [--w 800] [--h 1000] [--pad 0.06] [--radius 0] [--flatten ffffff]\n".data(using: .utf8)!)
    exit(1)
}

func f(_ k: String, _ d: Double) -> Double { Double(opts[k] ?? "") ?? d }
func i(_ k: String, _ d: Int) -> Int { Int(opts[k] ?? "") ?? d }

let mode = opts["mode"] ?? "cutout"
let outW = i("w", 800), outH = i("h", 1000)
let pad = f("pad", 0.06)
let radius = f("radius", 0)
let bgHex = opts["bg"] ?? "none"
let flattenHex = opts["flatten"]            // opcional: aplasta el fondo original antes de recortar
let cropRect: CGRect? = {
    guard let s = opts["crop"] else { return nil }
    let p = s.split(separator: ",").compactMap { Double($0) }
    guard p.count == 4 else { return nil }
    return CGRect(x: p[0], y: p[1], width: p[2], height: p[3]) // píxeles, origen arriba-izq
}()

func color(_ hex: String) -> (CGFloat, CGFloat, CGFloat)? {
    if hex == "none" { return nil }
    var s = hex.trimmingCharacters(in: .whitespaces)
    if s.hasPrefix("#") { s.removeFirst() }
    guard s.count == 6, let v = UInt32(s, radix: 16) else { return nil }
    return (CGFloat((v >> 16) & 0xFF) / 255, CGFloat((v >> 8) & 0xFF) / 255, CGFloat(v & 0xFF) / 255)
}

// MARK: - cargar

let inURL = URL(fileURLWithPath: positional[0])
let outURL = URL(fileURLWithPath: positional[1])
guard let src = CGImageSourceCreateWithURL(inURL as CFURL, nil),
      var img = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
    FileHandle.standardError.write("no pude abrir \(positional[0])\n".data(using: .utf8)!)
    exit(2)
}

if let c = cropRect { img = img.cropping(to: c) ?? img }
if let fh = flattenHex, let (r, g, b) = color(fh) { img = flatten(img, r, g, b) }

// MARK: - helpers

func flatten(_ image: CGImage, _ r: CGFloat, _ g: CGFloat, _ b: CGFloat) -> CGImage {
    let w = image.width, h = image.height
    guard let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0,
                              space: CGColorSpaceCreateDeviceRGB(),
                              bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { return image }
    ctx.setFillColor(CGColor(red: r, green: g, blue: b, alpha: 1))
    ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))
    ctx.draw(image, in: CGRect(x: 0, y: 0, width: w, height: h))
    return ctx.makeImage() ?? image
}

/// bbox del contenido (alpha > 0) en coordenadas de imagen (origen arriba-izq)
func contentBox(_ image: CGImage) -> CGRect {
    let w = image.width, h = image.height
    var data = [UInt8](repeating: 0, count: w * h * 4)
    guard let ctx = CGContext(data: &data, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                              space: CGColorSpaceCreateDeviceRGB(),
                              bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
        return CGRect(x: 0, y: 0, width: w, height: h)
    }
    ctx.draw(image, in: CGRect(x: 0, y: 0, width: w, height: h))
    var minX = w, minY = h, maxX = -1, maxY = -1
    for y in 0..<h {
        let row = y * w * 4
        for x in 0..<w where data[row + x * 4 + 3] > 6 {
            if x < minX { minX = x }
            if x > maxX { maxX = x }
            if y < minY { minY = y }
            if y > maxY { maxY = y }
        }
    }
    if maxX < 0 { return CGRect(x: 0, y: 0, width: w, height: h) }
    return CGRect(x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1)
}

/// Recorta el objeto y limpia el borde: erosión chica (saca el halo de color del
/// fondo, típico del pasto/hojas) + suavizado del alpha.
func cutout(_ image: CGImage, erode: Int) -> CGImage? {
    let w = image.width, h = image.height
    let handler = VNImageRequestHandler(cgImage: image, options: [:])
    let req = VNGenerateForegroundInstanceMaskRequest()
    do { try handler.perform([req]) } catch { return nil }
    guard let result = req.results?.first, !result.allInstances.isEmpty else { return nil }
    guard let buffer = try? result.generateMaskedImage(ofInstances: result.allInstances, from: handler,
                                                       croppedToInstancesExtent: false) else { return nil }
    let ci = CIImage(cvPixelBuffer: buffer)
    guard let masked = CIContext().createCGImage(ci, from: ci.extent) else { return nil }

    var rgba = [UInt8](repeating: 0, count: w * h * 4)
    guard let actx = CGContext(data: &rgba, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                               space: CGColorSpaceCreateDeviceRGB(),
                               bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { return nil }
    actx.draw(masked, in: CGRect(x: 0, y: 0, width: w, height: h))

    var alpha = [UInt8](repeating: 0, count: w * h)
    for i in 0..<(w * h) { alpha[i] = rgba[i * 4 + 3] }

    // erosión (min filter) para comer el halo de color del fondo
    if erode > 0 {
        var out = alpha
        for y in 0..<h {
            for x in 0..<w {
                var m = alpha[y * w + x]
                var dy = -erode
                while dy <= erode {
                    var dx = -erode
                    while dx <= erode {
                        let nx = x + dx, ny = y + dy
                        if nx >= 0, nx < w, ny >= 0, ny < h {
                            let v = alpha[ny * w + nx]
                            if v < m { m = v }
                        } else {
                            m = 0
                        }
                        dx += 1
                    }
                    dy += 1
                }
                out[y * w + x] = m
            }
        }
        alpha = out
    }

    // suavizado 3x3 para antialias del contorno
    do {
        var out = alpha
        for y in 0..<h {
            for x in 0..<w {
                var sum = 0, n = 0
                for dy in -1...1 {
                    for dx in -1...1 {
                        let nx = x + dx, ny = y + dy
                        if nx >= 0, nx < w, ny >= 0, ny < h {
                            sum += Int(alpha[ny * w + nx]); n += 1
                        }
                    }
                }
                out[y * w + x] = UInt8(sum / n)
            }
        }
        alpha = out
    }

    // recomposición premultiplicada (el color ya venía premultiplicado por el alpha viejo:
    // des-premultiplicamos y volvemos a premultiplicar con el alpha nuevo)
    for i in 0..<(w * h) {
        let a0 = Int(rgba[i * 4 + 3])
        let a = Int(alpha[i])
        for c in 0..<3 {
            let straight = a0 > 0 ? min(255, Int(rgba[i * 4 + c]) * 255 / a0) : 0
            rgba[i * 4 + c] = UInt8(straight * a / 255)
        }
        rgba[i * 4 + 3] = UInt8(a)
    }

    guard let cctx = CGContext(data: &rgba, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                               space: CGColorSpaceCreateDeviceRGB(),
                               bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { return nil }
    return cctx.makeImage()
}

// MARK: - canvas

let scale: CGFloat = 2
let cw = CGFloat(outW) * scale, ch = CGFloat(outH) * scale
guard let ctx = CGContext(data: nil, width: Int(cw), height: Int(ch), bitsPerComponent: 8, bytesPerRow: 0,
                          space: CGColorSpaceCreateDeviceRGB(),
                          bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { exit(3) }
ctx.interpolationQuality = .high
ctx.setShouldAntialias(true)

if let (r, g, b) = color(bgHex) {
    ctx.setFillColor(CGColor(red: r, green: g, blue: b, alpha: 1))
    ctx.fill(CGRect(x: 0, y: 0, width: cw, height: ch))
}

let inner = CGRect(x: cw * CGFloat(pad), y: ch * CGFloat(pad),
                   width: cw * (1 - 2 * CGFloat(pad)), height: ch * (1 - 2 * CGFloat(pad)))

func roundedPath(_ rect: CGRect, _ rad: CGFloat) -> CGPath {
    CGPath(roundedRect: rect, cornerWidth: rad, cornerHeight: rad, transform: nil)
}

switch mode {
case "frame":
    // cover crop al rect interno
    let iw = CGFloat(img.width), ih = CGFloat(img.height)
    let s = max(inner.width / iw, inner.height / ih)
    let dw = iw * s, dh = ih * s
    let dst = CGRect(x: inner.midX - dw / 2, y: inner.midY - dh / 2, width: dw, height: dh)
    ctx.saveGState()
    ctx.addPath(roundedPath(inner, CGFloat(radius) * scale))
    ctx.clip()
    ctx.draw(img, in: dst)
    ctx.restoreGState()

default: // cutout
    guard let cut = cutout(img, erode: i("erode", 2)) else {
        FileHandle.standardError.write("sin máscara\n".data(using: .utf8)!)
        exit(4)
    }
    let box = contentBox(cut).integral
    guard let piece = cut.cropping(to: box) else { exit(5) }
    let pw = CGFloat(piece.width), ph = CGFloat(piece.height)
    let s = min(inner.width / pw, inner.height / ph)
    let dw = pw * s, dh = ph * s
    // centrado
    let dst = CGRect(x: (cw - dw) / 2, y: (ch - dh) / 2, width: dw, height: dh)
    ctx.draw(piece, in: dst)
}

guard let out = ctx.makeImage() else { exit(6) }
let rep = NSBitmapImageRep(cgImage: out)
guard let data = rep.representation(using: .png, properties: [:]) else { exit(7) }
try data.write(to: outURL)
let box = contentBox(out)
print("ok \(positional[1]) \(outW)x\(outH) contenido=\(Int(box.width))x\(Int(box.height))")
