import zlib
import struct
import sys

def has_transparency(png_path):
    with open(png_path, 'rb') as f:
        signature = f.read(8)
        if signature != b'\x89PNG\r\n\x1a\n':
            print(f"Error: {png_path} is not a valid PNG file.")
            return False
            
        width = 0
        height = 0
        color_type = 0
        idat_data = b''
        
        while True:
            chunk_header = f.read(8)
            if len(chunk_header) < 8:
                break
            length, chunk_type = struct.unpack('>I4s', chunk_header)
            data = f.read(length)
            crc = f.read(4)
            
            if chunk_type == b'IHDR':
                width, height, bit_depth, color_type, compression, filter_method, interlace = struct.unpack('>IIBBBBB', data[:13])
                # color_type 6 is RGBA (Truecolor with alpha)
                if color_type != 6:
                    print(f"PNG color type is {color_type} (not RGBA). No transparency channel.")
                    return False
            elif chunk_type == b'IDAT':
                idat_data += data
            elif chunk_type == b'IEND':
                break
                
        if not idat_data:
            print("No IDAT chunks found.")
            return False
            
        # Decompress pixel data
        try:
            decompressed = zlib.decompress(idat_data)
        except Exception as e:
            print(f"Decompress error: {e}")
            return False
            
        # Bytes per pixel: 4 for RGBA
        bpp = 4
        stride = width * bpp + 1 # +1 for filter type byte
        
        # Scan through the decompressed image data to look for alpha < 255
        for y in range(height):
            row_start = y * stride
            # Skip the filter byte at row_start
            for x in range(width):
                pixel_offset = row_start + 1 + x * bpp
                alpha = decompressed[pixel_offset + 3]
                if alpha < 255:
                    # Found a pixel with transparency!
                    return True
        return False

if __name__ == '__main__':
    path = 'public/frames/frame_001.png'
    if len(sys.argv) > 1:
        path = sys.argv[1]
    transparent = has_transparency(path)
    print(f"File: {path}")
    print(f"Has transparent pixels: {transparent}")
