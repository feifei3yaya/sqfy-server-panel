import React, { useState, useEffect } from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface UserAvatarProps extends React.ComponentProps<typeof Avatar> {
  src?: string | null;
  alt?: string;
  name?: string;
}

const DEFAULT_AVATAR = '/default-avatar.svg';

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  src, 
  alt = '用户头像',
  name,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || DEFAULT_AVATAR);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // If src changes, reset error and try new src
    if (src) {
      setImgSrc(src);
      setHasError(false);
    } else {
      setImgSrc(DEFAULT_AVATAR);
    }
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(DEFAULT_AVATAR);
    }
    return false; // Prevent default error handling
  };

  return (
    <Avatar
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        handleError();
        return false;
      }}
      icon={(hasError || !imgSrc) ? <UserOutlined /> : undefined}
    />
  );
};

export default UserAvatar;