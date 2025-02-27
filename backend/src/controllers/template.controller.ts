import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AppError, catchAsync } from '../middlewares/error.middleware';
import { TemplateService } from '../services/template/template.service';

// テンプレート一覧の取得
export const getTemplates = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const templates = await TemplateService.getTemplates();

    res.status(200).json({
      status: 'success',
      results: templates.length,
      templates,
    });
  }
);

// テンプレート詳細の取得
export const getTemplateDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { templateId } = req.params;

    if (!templateId) {
      return next(new AppError('テンプレートIDは必須です', 400));
    }

    const templateDetails = await TemplateService.getTemplateDetails(templateId);

    res.status(200).json({
      status: 'success',
      template: templateDetails,
    });
  }
);

// テンプレートからプロジェクトを作成
export const createProjectFromTemplate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { templateId, projectName, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('認証が必要です', 401));
    }

    // プロジェクト名の重複チェック
    const existingProject = await prisma.project.findFirst({
      where: {
        name: projectName,
        userId,
      },
    });

    if (existingProject) {
      return next(new AppError('同じ名前のプロジェクトが既に存在します', 400));
    }

    // テンプレートからプロジェクトを作成
    const project = await TemplateService.createProjectFromTemplate(
      userId,
      templateId,
      projectName,
      description
    );

    res.status(201).json({
      status: 'success',
      project,
    });
  }
);