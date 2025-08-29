import os
from PIL import Image
import sys

def flip_images_in_directory(root_dir):
    """
    Lật tất cả các tệp hình ảnh (.jpg, .jpeg, .png) trong thư mục gốc và
    tất cả các thư mục con của nó.
    """
    # Kiểm tra xem đường dẫn thư mục có tồn tại không
    if not os.path.isdir(root_dir):
        print(f"Lỗi: Thư mục không tồn tại tại {root_dir}")
        return

    # Duyệt qua tất cả các thư mục và tệp từ thư mục gốc
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            # Tạo đường dẫn đầy đủ đến tệp
            file_path = os.path.join(dirpath, filename)
            
            # Kiểm tra xem tệp có phải là hình ảnh không
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                print(f"Đang lật ảnh: {file_path}")
                try:
                    # Mở hình ảnh
                    with Image.open(file_path) as img:
                        # Lật hình ảnh theo chiều ngang (LR_FLIP)
                        flipped_img = img.transpose(Image.FLIP_LEFT_RIGHT)
                        
                        # Lưu hình ảnh đã lật, ghi đè lên tệp gốc
                        flipped_img.save(file_path)
                        print(f"Đã lật và lưu thành công: {file_path}")
                        
                except Exception as e:
                    print(f"Lỗi khi xử lý tệp {file_path}: {e}")

if __name__ == "__main__":
    # Kiểm tra xem người dùng có cung cấp đường dẫn thư mục không
    if len(sys.argv) < 2:
        print("Vui lòng cung cấp đường dẫn đến thư mục chứa ảnh.")
        print("Cách sử dụng: python flip_images.py <đường_dẫn_thư_mục>")
    else:
        # Lấy đường dẫn thư mục từ đối số dòng lệnh
        root_folder = sys.argv[1]
        flip_images_in_directory(root_folder)