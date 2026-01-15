import os
import shutil

def move_and_rename_files(root_dir):
    """
    将指定根目录下各子目录中的唯一文件移动到根目录，并重命名为子目录名+原文件后缀
    移动成功后删除空的子目录
    
    Args:
        root_dir (str): 根目录的绝对/相对路径
    """
    # 验证根目录是否存在
    if not os.path.isdir(root_dir):
        print(f"错误：根目录 {root_dir} 不存在或不是有效目录！")
        return

    # 遍历根目录下的所有子项
    for dir_name in os.listdir(root_dir):
        # 拼接子目录的完整路径
        sub_dir_path = os.path.join(root_dir, dir_name)
        
        # 只处理目录（跳过文件）
        if not os.path.isdir(sub_dir_path):
            continue
        
        # 筛选子目录下的所有文件（排除子目录）
        files_in_subdir = [
            f for f in os.listdir(sub_dir_path)
            if os.path.isfile(os.path.join(sub_dir_path, f))
        ]
        
        # 检查子目录下是否只有一个文件
        if len(files_in_subdir) != 1:
            print(f"警告：目录 {dir_name} 下文件数量异常（{len(files_in_subdir)} 个），跳过！文件列表：{files_in_subdir}")
            continue
        
        # 获取唯一文件的信息
        old_file_name = files_in_subdir[0]
        old_file_path = os.path.join(sub_dir_path, old_file_name)
        # 拆分文件名和后缀（比如 index.json -> ('index', '.json')）
        _, file_ext = os.path.splitext(old_file_name)
        # 构造新文件名和路径
        new_file_name = f"{dir_name}{file_ext}"
        new_file_path = os.path.join(root_dir, new_file_name)
        
        # 执行移动并重命名操作（带异常处理）
        try:
            shutil.move(old_file_path, new_file_path)
            print(f"✅ 成功：{old_file_path} → {new_file_path}")
            
            # 移动成功后，尝试删除空的子目录
            try:
                os.rmdir(sub_dir_path)
                print(f"🗑️  已删除空目录：{sub_dir_path}")
            except OSError as e:
                # 捕获目录非空/权限不足等删除失败的情况
                print(f"⚠️  无法删除目录 {sub_dir_path} - {str(e)}")
                
        except FileExistsError:
            print(f"❌ 失败：目标文件 {new_file_path} 已存在，跳过！")
        except PermissionError:
            print(f"❌ 失败：无权限操作 {old_file_path}，跳过！")
        except Exception as e:
            print(f"❌ 失败：处理 {old_file_path} 时出错 - {str(e)}，跳过！")

if __name__ == "__main__":
    # 提示用户输入根目录路径，并做简单的去空格处理
    print("===== 文件批量移动重命名工具 =====")
    while True:
        root_dir = input("请输入根目录的完整路径（例如 Windows：C:\\test\\root | Linux：/home/test/root）：").strip()
        # 检查用户输入是否为空
        if not root_dir:
            print("错误：路径不能为空，请重新输入！")
            continue
        # 检查路径是否为有效目录
        if os.path.isdir(root_dir):
            break
        else:
            print(f"错误：路径 {root_dir} 不是有效目录，请重新输入！")
    
    # 执行核心逻辑
    move_and_rename_files(root_dir)
    print("\n✅ 批量移动重命名+删除空目录操作执行完成！")
